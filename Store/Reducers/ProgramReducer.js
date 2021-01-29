// Store/Reducers/ProgramReducer.js

const initialState = { runningProgram: null, programsGlobalList: [], playlistsGlobalList: [] }

function ProgramReducer(state = initialState, action) {
  let nextState
  switch (action.type) {
    case 'TOGGLE_PROGRAM':
      if (action.value !== state.runningProgram) {
        nextState = {
          ...state,
          runningProgram: action.value
        }
      }
      else {
        nextState = {
          ...state
        }
      }
      return nextState || state
    case 'STOP_PROGRAM':
      nextState = {
        ...state,
        runningProgram: null
      }
      return nextState
    case 'UPDATE_PROGRAMS':
      nextState = {
        ...state,
        programsGlobalList: action.value
      }
      return nextState
    case 'UPDATE_PLAYLISTS':
      nextState = {
        ...state,
        playlistsGlobalList: action.value
      }
      return nextState
    case 'UPDATE_WHEELS':
      nextState = {
        ...state,
        wheelsGlobalList: action.value
      }
      return nextState
    default:
      return state
  }
}

export default ProgramReducer