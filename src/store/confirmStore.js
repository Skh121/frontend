import { create } from 'zustand';

const useConfirmStore = create((set) => ({
    isOpen: false,
    message: '',
    options: {},
    resolve: null,

    openConfirm: (message, options, resolve) => set({
        isOpen: true,
        message,
        options,
        resolve
    }),

    closeConfirm: () => set({
        isOpen: false,
        message: '',
        options: {},
        resolve: null
    }),
}));

export default useConfirmStore;
