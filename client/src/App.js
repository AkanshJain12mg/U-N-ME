import {Routes , Route} from 'react-router-dom'
import './App.css';
import HomeScreen from './screens/home.jsx'
import RoomPage from './screens/room.jsx';

function App() {
  return (
    <div className="App">

      <Routes>

        <Route path="/" element={<HomeScreen />} />
        <Route path="/room/:roomId" element={<RoomPage />} />

      </Routes>
      
    </div>
  );
}

export default App;
