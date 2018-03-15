import * as types from './../actions/action-type.js'
import db from './../data/db.js'
const initialState = {
	show:false,
	planlist:db,
    user:{

    },
    loading:false,
}

const PlanReducer = function(state = initialState,action){
    let list = state.planlist;
    switch(action.type){
        case types.ADD:
            list.push(action.item);
            //拷贝属性值  
            return Object.assign({},state,{planlist:list});
        case types.DELETE: 
            //过滤掉选择删除的item返回剩下的数组
            let newstate = list.filter((item)=>item.id!==action.id);
            return Object.assign({},state,{planlist:newstate});  
        case types.SHOW: 
            return Object.assign({},state,{show:action.show});
        case types.USER: 
            return Object.assign({},state,{user:action.user});
        case types.LOADING: 
            return Object.assign({},state,{loading:action.loading});
    }
    return state;
}

export default PlanReducer;