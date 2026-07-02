import { useReducer } from 'react';

function spreadReducer<T>(state: T, patch: Partial<T>): T{
    return { ...state, ...patch };
}

export function useReducerSpread<T extends object>(initialState: T) {
    return useReducer(spreadReducer, initialState);
}
