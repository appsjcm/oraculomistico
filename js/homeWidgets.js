
// V9.1 Home Widgets
import { buildHomeComplete } from './homeComplete.js';

export function getHomeWidgets(){
  return {
    home: buildHomeComplete(),
    widgets: ['oracle','favorites','profile','stats']
  };
}
