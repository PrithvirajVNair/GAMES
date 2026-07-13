const STORAGE_KEY = 'fqz_sudoku_save';

export const saveGame = (gameState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  } catch (error) {
    console.error('Error saving Sudoku game:', error);
  }
};

export const loadGame = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Error loading Sudoku game:', error);
    return null;
  }
};

export const clearGame = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing Sudoku save:', error);
  }
};
