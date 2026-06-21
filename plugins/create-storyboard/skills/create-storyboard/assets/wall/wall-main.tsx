// Standalone entry for the whole-wall page. Mounts the pan/zoom canvas at #root.
// `./stories/styles.css` is the project's StyleX sink (the file carrying the `@stylex;` directive);
// adjust the path to wherever your storyboard keeps it.
import { createRoot } from 'react-dom/client';
import './stories/styles.css';
import { StoryboardWall } from './stories/Wall';

createRoot(document.getElementById('root')!).render(<StoryboardWall />);
