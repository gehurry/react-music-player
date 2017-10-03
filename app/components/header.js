import React from 'react';
import { Router, IndexRoute, Link, Route, hashHistory } from 'react-router';
import './header.less';

let Header  = React.createClass({
	render(){
		return (
			<Link to = "/"><div className="components-header row">
				
					<img src = './static/images/logo.png' width = '40' alt =""  className = "-col-auto"/>
					<h1 className="caption">React Music Player</h1>
				
			</div></Link>
		);

	}

});

export default Header;