import { parsePath } from '../lib/parse-path';

describe('parsePath()', () => {
    test.each([
        { pathname: '/', expected: {} },
    ])('.', ({ pathname, expected }) => {
        expect(parsePath(pathname)).toMatchObject(expected);
    })
});