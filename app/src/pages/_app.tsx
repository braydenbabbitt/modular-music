import { Outlet } from 'react-router-dom';
import '../global-styles.css';

export default function App() {
  return (
    <div
      css={{
        fontFamily: 'inter',
      }}
    >
      <Outlet />
    </div>
  );
}
