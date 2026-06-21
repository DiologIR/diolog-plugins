// The wall is ALSO a Storybook story (so it's browsable inside Storybook), not only the standalone page.
import type { Meta, StoryObj } from '@storybook/react-vite';
import { StoryboardWall } from './Wall';

const meta: Meta<typeof StoryboardWall> = {
  title: 'Storyboard/▸ The whole wall',
  component: StoryboardWall,
  parameters: { layout: 'fullscreen' },
};
export default meta;
export const TheWholeWall: StoryObj = {};
