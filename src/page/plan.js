import React,{ Component } from 'react'
import { connect } from 'react-redux';
import store from '../redux/store.js';
import { Button } from 'antd-mobile';
//引入定义的action
import { show,deletePlan } from '../actions/plan.js'
import Footer from './../components/footer.js';
 
class Plan extends Component {
	constructor(props){
        super(props);
        this.show = this.show.bind(this);
	}
    // 显示弹出
    show () {
        let b = this.props.data.show;
        store.dispatch(show(!b));
    }
    // 删除计划
    delete (id) {
        store.dispatch(deletePlan(id));
    }
    //js 跳转路由
    detail (id) {
        this.props.history.push(`/detail/${id}`);
    }
    componentDidMount(){
    }
	render(){
		return (
			<div>
                <div className="plant">
                    <h3>计划表</h3>
                    <p onClick={this.show}>添加计划</p>
                </div>
                <table className="planlist">
                    <thead>
                        <tr>
                            <th>标题</th>
                            <th>内容</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            this.props.data.planlist.map((item,index)=>{
                                return (
                                    <tr key={index}>
                                        <td className="plan-title" onClick={this.detail.bind(this, item.id)}>{item.title}</td>
                                        <td className="plan-title">{item.content}</td>
                                        <td className="plan-delect" onClick={this.delete.bind(this, item.id)}>删除</td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
                <Button loading>This is a button</Button>
                <Footer />
            </div>
		)
	}
}

const mapStateToProps = function(store){
    return {
        data:store.data
    };
};

export default connect(mapStateToProps)(Plan);