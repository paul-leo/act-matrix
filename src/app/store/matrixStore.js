import { createContext, useContext, useEffect, useState } from 'react';

// 矩阵状态管理
const STORAGE_KEY = 'act_matrix_current_id';

// 使用 useState 管理状态，移除 reducer

// Context
const MatrixContext = createContext();

// Provider 组件
export function MatrixProvider({ children }) {
    const [currentMatrixId, setCurrentMatrixId] = useState(null);
    const [matrices, setMatrices] = useState(() => new Map());

    // 生成新的矩阵ID
    const generateNewMatrixId = () => {
        return `matrix_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    };

    // 从本地存储加载当前矩阵ID；若不存在则生成并持久化
    useEffect(() => {
        try {
            let id = localStorage.getItem(STORAGE_KEY);
            if (!id) {
                id = generateNewMatrixId();
                localStorage.setItem(STORAGE_KEY, id);
            }
            setCurrentMatrixId(id);
        } catch (error) {
            console.warn('Failed to load matrix ID from storage:', error);
        }
    }, []);


    // 保存当前矩阵ID到本地存储
    useEffect(() => {
        try {
            if (currentMatrixId) {
                localStorage.setItem(STORAGE_KEY, currentMatrixId);
            } else {
                localStorage.removeItem(STORAGE_KEY);
            }
        } catch (error) {
            console.warn('Failed to save matrix ID to storage:', error);
        }
    }, [currentMatrixId]);

    // Actions
    const setCurrentMatrix = (matrixId) => {
        setCurrentMatrixId(matrixId);
        try {
            if (matrixId) {
                localStorage.setItem(STORAGE_KEY, matrixId);
            } else {
                localStorage.removeItem(STORAGE_KEY);
            }
        } catch (error) {
            console.warn('Failed to persist current matrix ID:', error);
        }
    };

    const setMatrixData = (matrixId, data) => {
        setMatrices((prev) => {
            const newMatrices = new Map(prev);
            newMatrices.set(matrixId, data);
            return newMatrices;
        });
    };

    const clearMatrixData = (matrixId) => {
        setMatrices((prev) => {
            const newMatrices = new Map(prev);
            newMatrices.delete(matrixId);
            return newMatrices;
        });
    };

    const getCurrentMatrixData = () => {
        if (!currentMatrixId) return null;
        return matrices.get(currentMatrixId) || null;
    };

    // 创建新矩阵
    const createNewMatrix = () => {
        const newMatrixId = generateNewMatrixId();
        setCurrentMatrix(newMatrixId);
        return newMatrixId;
    };

    const value = {
        // 状态
        currentMatrixId,
        matrices,
        
        // Actions
        setCurrentMatrix,
        setMatrixData,
        clearMatrixData,
        getCurrentMatrixData,
        createNewMatrix,
    };

    return (
        <MatrixContext.Provider value={value}>
            {children}
        </MatrixContext.Provider>
    );
}

// Hook
export function useMatrix() {
    const context = useContext(MatrixContext);
    if (!context) {
        throw new Error('useMatrix must be used within a MatrixProvider');
    }
    return context;
}

//
