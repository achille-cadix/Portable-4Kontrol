// Store/configureStore.js

import { createStore } from 'redux';
import ProgramReducer from './Reducers/ProgramReducer'

export default createStore(ProgramReducer)