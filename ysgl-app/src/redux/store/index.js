// 引入createStore创建store，引入applyMiddleware 来使用中间件
import { createStore } from 'redux';
// 引入所有的reducer
import reducer from './../reducer';
// 安装redux-devtools-extension的可视化工具。

const initialState = {
    menuName: '',
    userName:'',
    userId:'',
}
const configureStore = () => createStore(reducer, initialState);

export default configureStore;