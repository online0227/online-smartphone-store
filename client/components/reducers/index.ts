import {combineReducers} from 'redux';
import {reducer as form} from 'redux-form';
import { AuthReducer } from './authentication';
import { AdminReducer }  from './admin';
import core from './apiCore';
import cart from './cart';
import user from './apiUser';
import markdown from './markdown';

const rootReducer = combineReducers({
    form,
    auth: AuthReducer,
    admin: AdminReducer,
    core,
    cart,
    user,
    markdown
});

export type AppState = ReturnType<typeof rootReducer>;
export default rootReducer;