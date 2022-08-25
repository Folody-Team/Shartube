import { ComicCard } from "../components/ComicCard";
import { storiesOf } from '@storybook/react';

const stories = storiesOf('App test', module);

stories.add('App', () => {
  return (
      <ComicCard/>
  );
});
