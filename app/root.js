import React from 'react';
import Header from './components/header';
import Progress from './components/progress';
import jPlayer  from 'jplayer';
import $ from 'jquery';
import Player  from './page/player';
import MusicList  from './page/musiclist';
import { MUSIC_LIST } from './config/musiclist';
import { Router, IndexRoute, Link, Route, hashHistory } from 'react-router';
import Pubsub from 'pubsub-js';
import { randomRange } from './utils/util';


 
let App = React.createClass({
		getInitialState() {
	 	// console.log(MUSIC_LIST);
		return {		
			musicList: MUSIC_LIST,
			currentMusicItem: MUSIC_LIST[0],
			repeatType: 'cycle'
		};
	},
// 播放音乐
	playMusic(musicItem){
		$('#player').jPlayer('setMedia',{mp3: musicItem.file}).jPlayer('play');

		this.setState({
			currentMusicItem:musicItem
		});
	},

	playNext( type = 'next'){
		let index = this.findMusicIndex(this.state.currentMusicItem);
		let newIndex = null;
		let musicListlength = this.state.musicList.length;

		if (type === 'next') {
			newIndex = (index +1) % musicListlength;
		}
		else{
			newIndex = (index -1 +musicListlength) % musicListlength;
		}

		this.playMusic(this.state.musicList[newIndex]);

	}, 


	findMusicIndex( musicItem ){
 		return this.state.musicList.indexOf(musicItem);
	},

	playWhenEnd(){
		if(this.state.repeatType === 'random'){
			let index = this.findMusicIndex(this.state.currentMusicItem);
			let randomIndex = randomRange(0, this.state.musicList.length - 1);
			while(randomIndex === index) {
				randomIndex = randomRange(0, this.state.musicList.length - 1);
			}
			this.playMusic(this.state.musicList[randomIndex]);
		} else if (this.state.repeatType === 'once') {
			this.playMusic(this.state.currentMusicItem);
			
		} else {
			this.playNext();
		}
	},

	componentDidMount() {
		$('#player').jPlayer({
			supplied: 'mp3',
			wmode: 'window'
		});
		this.playMusic(this.state.currentMusicItem);
		$('#player').bind($.jPlayer.event.ended, (e) => {
			this.playWhenEnd();
		});


		$('#player').bind($.jPlayer.event.ended, (e) =>{
			this.playNext();
		});

		
		Pubsub.subscribe('DELETE_MUSIC',(msg, musicItem)=>{
			 this.setState({
			 	//过滤剩余的列表
			 	musicList: this.state.musicList.filter(item =>{
			 		return item !== musicItem;
			 	})
			 })
		});


		Pubsub.subscribe('PLAY_MUSIC',(msg, musicItem)=>{
			this.playMusic(musicItem);
		});
		Pubsub.subscribe('PLAY_PREV',(msg, musicItem)=>{
			this.playNext('prev');
		});
		Pubsub.subscribe('PLAY_NEXT',(msg, musicItem)=>{
			this.playNext();
		});

		let repeatList = [
			'cycle',
			'once',
			'random'
		];
		Pubsub.subscribe('CHANAGE_REPEAT', () => {
			let  index = repeatList.indexOf(this.state.repeatType);
			index = (index + 1 )% repeatList.length;
			this.setState({
				repeatType: repeatList[index]
			});
		});
		
	},
	componentWillMount() {
		Pubsub.unsubscribe('PLAY_MUSIC');
		Pubsub.unsubscribe('DELETE_MUSIC');
		Pubsub.unsubscribe('PLAY_PREV');
		Pubsub.unsubscribe('PLAY_NEXT');
		PubSub.unsubscribe('CHANAGE_REPEAT');
		$('#player').unbind($.jPlayer.event.ended);
	},
	render(){
		return (
			<div>
				<Header />
					{ React.cloneElement(this.props.children, this.state) }
			</div>
		);
	}
});


let Root = React.createClass({
	render() {
		return (
			<Router history = {hashHistory}>
				<Route path = "/" component = {App}>
					<IndexRoute component = {Player}></IndexRoute>
					<Route path = "/list" component = {MusicList}></Route>
				</Route>
			</Router>
		);
	}

});

export default Root;