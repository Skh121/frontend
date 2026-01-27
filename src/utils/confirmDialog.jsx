import useConfirmStore from '../store/confirmStore';

/**
 * Show a confirmation dialog using globally rendered modal
 * @param {string} message - The confirmation message
 * @param {Object} options - Options for the confirmation
 * @returns {Promise<boolean>} - Resolves to true if confirmed, false if cancelled
 */
export const confirmDialog = (message, options = {}) => {
  return new Promise((resolve) => {
    useConfirmStore.getState().openConfirm(message, options, resolve);
  });
};

export default confirmDialog;

