import { useParams } from '@root/router';

const TestIdPage = () => {
  const { testId } = useParams('/:testId');

  return <h1>Test ID: {testId}</h1>;
};

export default TestIdPage;
