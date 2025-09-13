import { createContext, useContext, useReducer, useEffect, useRef } from 'react';

// 矩阵状态管理
const STORAGE_KEY = 'act_matrix_current_id';

// 初始状态
const initialState = {
    currentMatrixId: null,
    matrices: new Map(), // 存储不同矩阵的数据
};

// Action 类型
const ACTIONS = {
    SET_CURRENT_MATRIX: 'SET_CURRENT_MATRIX',
    SET_MATRIX_DATA: 'SET_MATRIX_DATA',
    CLEAR_MATRIX_DATA: 'CLEAR_MATRIX_DATA',
    LOAD_FROM_STORAGE: 'LOAD_FROM_STORAGE',
};

// Reducer
function matrixReducer(state, action) {
    switch (action.type) {
        case ACTIONS.SET_CURRENT_MATRIX:
            return {
                ...state,
                currentMatrixId: action.payload,
            };
        
        case ACTIONS.SET_MATRIX_DATA:
            const newMatrices = new Map(state.matrices);
            newMatrices.set(action.payload.matrixId, action.payload.data);
            return {
                ...state,
                matrices: newMatrices,
            };
        
        case ACTIONS.CLEAR_MATRIX_DATA:
            const clearedMatrices = new Map(state.matrices);
            clearedMatrices.delete(action.payload);
            return {
                ...state,
                matrices: clearedMatrices,
            };
        
        case ACTIONS.LOAD_FROM_STORAGE:
            return {
                ...state,
                currentMatrixId: action.payload,
            };
        
        default:
            return state;
    }
}

// Context
const MatrixContext = createContext();

// Provider 组件
export function MatrixProvider({ children }) {
    const [state, dispatch] = useReducer(matrixReducer, initialState);
    const loadedFromStorageRef = useRef(false);

    // 从本地存储加载当前矩阵ID
    useEffect(() => {
        try {
            const savedMatrixId = localStorage.getItem(STORAGE_KEY);
            if (savedMatrixId) {
                dispatch({
                    type: ACTIONS.LOAD_FROM_STORAGE,
                    payload: savedMatrixId,
                });
            }
            // 标记已尝试从本地存储加载
            loadedFromStorageRef.current = true;
        } catch (error) {
            console.warn('Failed to load matrix ID from storage:', error);
        }
    }, []);

    // 在未有当前矩阵ID时自动生成一个
    useEffect(() => {
        if (!loadedFromStorageRef.current) return; // 等待加载完成
        if (!state.currentMatrixId) {
            const newId = `matrix_${Date.now()}_${Math.random()
                .toString(36)
                .substr(2, 9)}`;
            dispatch({ type: ACTIONS.SET_CURRENT_MATRIX, payload: newId });
        }
        // 仅依赖于 currentMatrixId 的变化
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.currentMatrixId]);

    // 保存当前矩阵ID到本地存储
    useEffect(() => {
        try {
            if (state.currentMatrixId) {
                localStorage.setItem(STORAGE_KEY, state.currentMatrixId);
            } else {
                localStorage.removeItem(STORAGE_KEY);
            }
        } catch (error) {
            console.warn('Failed to save matrix ID to storage:', error);
        }
    }, [state.currentMatrixId]);

    // Actions
    const setCurrentMatrix = (matrixId) => {
        dispatch({
            type: ACTIONS.SET_CURRENT_MATRIX,
            payload: matrixId,
        });
    };

    const setMatrixData = (matrixId, data) => {
        dispatch({
            type: ACTIONS.SET_MATRIX_DATA,
            payload: { matrixId, data },
        });
    };

    const clearMatrixData = (matrixId) => {
        dispatch({
            type: ACTIONS.CLEAR_MATRIX_DATA,
            payload: matrixId,
        });
    };

    const getCurrentMatrixData = () => {
        if (!state.currentMatrixId) return null;
        return state.matrices.get(state.currentMatrixId) || null;
    };

    // 生成新的矩阵ID
    const generateNewMatrixId = () => {
        return `matrix_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    };

    // 创建新矩阵
    const createNewMatrix = () => {
        const newMatrixId = generateNewMatrixId();
        setCurrentMatrix(newMatrixId);
        return newMatrixId;
    };

    const value = {
        // 状态
        currentMatrixId: state.currentMatrixId,
        matrices: state.matrices,
        
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

// 导出 actions 和 types
export { ACTIONS };
