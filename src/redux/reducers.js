import { combineReducers } from 'redux';

// Reducers
import data from './data';

// Combine Reducers
var reducers = combineReducers({
    data: data
});
//连接reducers
export default reducers;