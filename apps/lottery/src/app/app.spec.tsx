import { act, render } from '@testing-library/react';
import App from './app';

describe('App', () => {
  it('should render successfully', async () => {
    const promise = Promise.resolve();
    const { baseElement } = render(<App />);

    expect(baseElement).toBeTruthy();

    // Why act needed: https://kentcdodds.com/blog/fix-the-not-wrapped-in-act-warning
    await act(() => promise);
  });
});
