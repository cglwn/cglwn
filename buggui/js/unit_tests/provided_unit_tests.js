'use strict';

var expect = chai.expect;
var sceneGraphModule = createSceneGraphModule();
describe('CarNode', function () {
    it('should accept hits within by default', function () {
        var carNode = new sceneGraphModule.CarNode();
        expect(carNode.pointInObject({x: 0, y: 0}), 'center').to.be.ok;
        expect(carNode.pointInObject({x: 0, y: 25}), 'center').to.be.ok;
        expect(carNode.pointInObject({x: 0, y: -25}), 'center').to.be.ok;
    });

    it('translates correctly', function () {
        var carNode = new sceneGraphModule.CarNode();
        carNode.startPositionTransform.translate(100, 100);
        expect(carNode.pointInObject({x: 100, y: 100}), 'center').to.be.ok;
        expect(carNode.pointInObject({x: 0, y: 0}), 'should no longer be in point').to.not.be.ok;
    });

    it('scale startPositionTransform correctly', function() {
        var carNode = new sceneGraphModule.CarNode();
        carNode.startPositionTransform.scale(10, 10);
        expect(carNode.pointInObject({x: 0, y: 0}), 'center').to.be.ok;
        expect(carNode.pointInObject({x: 100, y: 50}), 'large').to.be.ok;
    });

    it('scale objectTransform correctly', function() {
        var carNode = new sceneGraphModule.CarNode();
        carNode.objectTransform.scale(10, 10);
        expect(carNode.pointInObject({x: 0, y: 0}), 'center').to.be.ok;
        expect(carNode.pointInObject({x: 100, y: 50}), 'large').to.be.ok;
    });

    it('scale startPositionTransform and objectTransform correctly', function() {
        var carNode = new sceneGraphModule.CarNode();
        carNode.objectTransform.scale(10, 10);
        carNode.startPositionTransform.scale(10, 10);
        expect(carNode.pointInObject({x: 0, y: 0}), 'center').to.be.ok;
        expect(carNode.pointInObject({x: 500, y: 500}), 'off').to.be.ok;
        expect(carNode.pointInObject({x: 500, y: -500}), 'off').to.be.ok;
        expect(carNode.pointInObject({x: -500, y: 500}), 'off').to.be.ok;
        expect(carNode.pointInObject({x: -500, y: -500}), 'off').to.be.ok;
    });
});

describe('AxleNode', function() {
    it('should never be selectable', function() {
        var axleNode = new sceneGraphModule.AxleNode('some');
        expect(axleNode.pointInObject({x: Math.random(), y: Math.random()}), 'any number').to.not.be.ok;
    });
});

describe('TireNode', function() {
    it('should be correctly bounded', function() {
        var tireNode = new sceneGraphModule.TireNode('some');
        expect(tireNode.pointInObject({x: 4, y: 9}), 'any number').to.be.ok;
    });
});