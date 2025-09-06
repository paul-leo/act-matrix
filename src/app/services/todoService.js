import AppSdk from '@morphixai/app-sdk';
import { reportError } from '@morphixai/lib';

/**
 * Todo数据服务
 * 提供云存储和本地存储的统一接口
 */
class TodoService {
    constructor() {
        this.COLLECTION_NAME = 'todos';
        this.LOCAL_STORAGE_KEY = 'morphix_todos_backup';
    }

    /**
     * 获取所有Todo项目
     */
    async getAllTodos() {
        try {
            // 尝试从云端获取数据
            const cloudTodos = await AppSdk.appData.queryData({
                collection: this.COLLECTION_NAME,
                query: [] // 获取所有数据
            });
            
            // 过滤掉无效数据并按创建时间排序
            const validTodos = cloudTodos
                .filter(todo => todo && todo.text && todo.text.trim() !== '')
                .sort((a, b) => a.createdAt - b.createdAt);
            
            // 同步到本地存储作为备份
            this.saveToLocalStorage(validTodos);
            
            return validTodos;
        } catch (error) {
            await reportError(error, 'JavaScriptError', {
                component: 'TodoService.getAllTodos'
            });
            
            // 云端失败时，尝试从本地存储获取
            const localTodos = this.getFromLocalStorage();
            // 同样过滤本地数据
            return localTodos.filter(todo => todo && todo.text && todo.text.trim() !== '');
        }
    }

    /**
     * 创建新的Todo项目
     */
    async createTodo(todoData) {
        // 验证数据有效性
        if (!todoData || !todoData.text || todoData.text.trim() === '') {
            throw new Error('Todo内容不能为空');
        }

        try {
            const newTodo = {
                ...todoData,
                text: todoData.text.trim(), // 确保去除首尾空格
                createdAt: Date.now(),
                updatedAt: Date.now()
            };

            // 保存到云端
            const result = await AppSdk.appData.createData({
                collection: this.COLLECTION_NAME,
                data: newTodo
            });

            // 更新本地存储
            const allTodos = await this.getAllTodos();
            
            return result;
        } catch (error) {
            await reportError(error, 'JavaScriptError', {
                component: 'TodoService.createTodo'
            });
            
            // 云端失败时，保存到本地存储
            const localTodos = this.getFromLocalStorage();
            const newTodo = {
                id: `local_${Date.now()}`,
                ...todoData,
                text: todoData.text.trim(), // 确保去除首尾空格
                createdAt: Date.now(),
                updatedAt: Date.now(),
                isLocal: true // 标记为本地数据
            };
            
            const updatedTodos = [...localTodos, newTodo];
            this.saveToLocalStorage(updatedTodos);
            
            return newTodo;
        }
    }

    /**
     * 更新Todo项目
     */
    async updateTodo(todoId, updateData) {
        try {
            const updatedData = {
                ...updateData,
                updatedAt: Date.now()
            };

            // 更新云端数据
            const result = await AppSdk.appData.updateData({
                collection: this.COLLECTION_NAME,
                id: todoId,
                data: updatedData
            });

            // 更新本地存储
            const allTodos = await this.getAllTodos();
            
            return result;
        } catch (error) {
            await reportError(error, 'JavaScriptError', {
                component: 'TodoService.updateTodo'
            });
            
            // 云端失败时，更新本地存储
            const localTodos = this.getFromLocalStorage();
            const updatedTodos = localTodos.map(todo => 
                todo.id === todoId 
                    ? { ...todo, ...updateData, updatedAt: Date.now(), isLocal: true }
                    : todo
            );
            
            this.saveToLocalStorage(updatedTodos);
            
            return updatedTodos.find(todo => todo.id === todoId);
        }
    }

    /**
     * 删除Todo项目
     */
    async deleteTodo(todoId) {
        try {
            // 从云端删除
            await AppSdk.appData.deleteData({
                collection: this.COLLECTION_NAME,
                id: todoId
            });

            // 更新本地存储
            const allTodos = await this.getAllTodos();
            
            return { success: true };
        } catch (error) {
            await reportError(error, 'JavaScriptError', {
                component: 'TodoService.deleteTodo'
            });
            
            // 云端失败时，从本地存储删除
            const localTodos = this.getFromLocalStorage();
            const updatedTodos = localTodos.filter(todo => todo.id !== todoId);
            this.saveToLocalStorage(updatedTodos);
            
            return { success: true };
        }
    }

    /**
     * 同步本地数据到云端
     */
    async syncLocalToCloud() {
        try {
            const localTodos = this.getFromLocalStorage();
            const localOnlyTodos = localTodos.filter(todo => todo.isLocal);
            
            const syncResults = [];
            
            for (const todo of localOnlyTodos) {
                try {
                    const { isLocal, ...todoData } = todo;
                    const result = await AppSdk.appData.createData({
                        collection: this.COLLECTION_NAME,
                        data: todoData
                    });
                    syncResults.push({ success: true, localId: todo.id, cloudId: result.id });
                } catch (error) {
                    syncResults.push({ success: false, localId: todo.id, error });
                }
            }
            
            // 重新获取所有数据以确保同步
            await this.getAllTodos();
            
            return syncResults;
        } catch (error) {
            await reportError(error, 'JavaScriptError', {
                component: 'TodoService.syncLocalToCloud'
            });
            return [];
        }
    }

    /**
     * 保存到本地存储
     */
    saveToLocalStorage(todos) {
        try {
            localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(todos));
        } catch (error) {
            console.warn('本地存储失败:', error);
        }
    }

    /**
     * 从本地存储获取
     */
    getFromLocalStorage() {
        try {
            const stored = localStorage.getItem(this.LOCAL_STORAGE_KEY);
            if (!stored) {
                return [];
            }
            
            const todos = JSON.parse(stored);
            // 确保返回的是数组且过滤掉无效数据
            if (!Array.isArray(todos)) {
                return [];
            }
            
            return todos.filter(todo => todo && todo.text && todo.text.trim() !== '');
        } catch (error) {
            console.warn('本地存储读取失败:', error);
            // 清除损坏的本地存储数据
            this.clearLocalStorage();
            return [];
        }
    }

    /**
     * 清除本地存储
     */
    clearLocalStorage() {
        try {
            localStorage.removeItem(this.LOCAL_STORAGE_KEY);
        } catch (error) {
            console.warn('清除本地存储失败:', error);
        }
    }

    /**
     * 清理无效数据
     */
    async cleanupInvalidData() {
        try {
            // 清理本地存储中的无效数据
            const localTodos = this.getFromLocalStorage();
            const validLocalTodos = localTodos.filter(todo => todo && todo.text && todo.text.trim() !== '');
            
            if (validLocalTodos.length !== localTodos.length) {
                this.saveToLocalStorage(validLocalTodos);
            }

            // 如果可能的话，也清理云端的无效数据
            // 这里可以添加云端数据清理逻辑
        } catch (error) {
            console.warn('数据清理失败:', error);
        }
    }
}

// 导出单例实例
export default new TodoService();
