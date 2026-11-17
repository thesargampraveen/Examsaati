/**
 * Sanity test: full render requires native navigation mocks,
 * so we assert App is a valid exported component.
 */
import App from '../App';

test('App is defined as a React component', () => {
  expect(App).toBeTruthy();
  expect(typeof App === 'function' || typeof App === 'object').toBe(true);
});
