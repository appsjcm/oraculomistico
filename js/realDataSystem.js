
// V17.0 Real Data System

export const RealDataSystem = {
  save(key, value){
    localStorage.setItem(key, JSON.stringify(value));
  },

  load(key, fallback = null){
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  },

  remove(key){
    localStorage.removeItem(key);
  }
};
