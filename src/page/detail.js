import React,{ Component } from 'react'
import { connect } from 'react-redux';
 
class Detail extends Component {
	constructor(props){
        super(props);
	}
    componentDidMount(){
    	console.log('hhhhhhhhhhhhhhh');
    }
	render(){
		return (
			<div>detail</div>
		)
	}
}

const mapStateToProps = function(store){
    return {
        data:store.data
    };
};

export default connect(mapStateToProps)(Detail);