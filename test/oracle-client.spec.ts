import * as assert from "node:assert";

describe('Oracle Client', () => {
    it('test 1', () => {
        const name = 'foo'
        assert.equal(name, 'foo');
        assert.notEqual(name, 'bar');
    });
});
