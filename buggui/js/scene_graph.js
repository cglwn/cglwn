'use strict';

/**
 * A function that creates and returns the scene graph classes and constants.
 */
function createSceneGraphModule() {

    // Part names. Use these to name your different nodes
    var CAR_PART = 'CAR_PART';
    var FRONT_AXLE_PART = 'FRONT_AXLE_PART';
    var BACK_AXLE_PART = 'BACK_AXLE_PART';
    var FRONT_LEFT_TIRE_PART = 'FRONT_LEFT_TIRE_PART';
    var FRONT_RIGHT_TIRE_PART = 'FRONT_RIGHT_TIRE_PART';
    var BACK_LEFT_TIRE_PART = 'BACK_LEFT_TIRE_PART';
    var BACK_RIGHT_TIRE_PART = 'BACK_RIGHT_TIRE_PART';

    var STATE = createNodeState();
    var SELECT_STATE = STATE.SELECT_STATE;
    var HOVER_STATE = STATE.HOVER_STATE;


    var GraphNode = function () {
    };

    _.extend(GraphNode.prototype, {

        /**
         * Subclasses should call this function to initialize the object.
         *
         * @param startPositionTransform The transform that should be applied prior
         * to performing any rendering, so that the component can render in its own,
         * local, object-centric coordinate system.
         * @param nodeName The name of the node. Useful for debugging, but also used to uniquely identify each node
         */
        initGraphNode: function (startPositionTransform, nodeName) {
            this.nodeName = nodeName;

            // The transform that will position this object, relative
            // to its parent
            this.startPositionTransform = startPositionTransform;

            // Any additional transforms of this object after the previous transform
            // has been applied
            this.objectTransform = new AffineTransform();

            // Any child nodes of this node
            this.children = {};

            // Add any other properties you need, here
        },

        addChild: function (graphNode) {
            this.children[graphNode.nodeName] = graphNode;
        },

        setState: function (state) {
            this.state = state;
            for (var part in this.children) {
                this.children[part].setState(state);
            }
        },

        /**
         * Swaps a graph node with a new graph node.
         * @param nodeName The name of the graph node
         * @param newNode The new graph node
         */
        replaceGraphNode: function (nodeName, newNode) {
            if (nodeName in this.children) {
                this.children[nodeName] = newNode;
            } else {
                _.each(
                    _.values(this.children),
                    function (child) {
                        child.replaceGraphNode(nodeName, newNode);
                    }
                );
            }
        },

        /**
         * Render this node using the graphics context provided.
         * Prior to doing any painting, the start_position_transform must be
         * applied, so the component can render itself in its local, object-centric
         * coordinate system. See the assignment specs for more details.
         *
         * This method should also call each child's render method.
         * @param context
         */
        render: function (context) {

        },

        /**
         * Determines whether a point lies within this object. Be sure the point is
         * transformed correctly prior to performing the hit test.
         */
        pointInObject: function (point) {

        }
    });

    var CarNode = function () {
        this.initGraphNode(new AffineTransform(), CAR_PART);
        this.state = SELECT_STATE.DEFAULT;
    };

    _.extend(CarNode.prototype, GraphNode.prototype, {
        // Overrides parent method
        render: function (context) {
            context.save();
            var startPositionTransform = this.startPositionTransform;
            var objectTransform = this.objectTransform;
            context.translate(startPositionTransform.getTranslateX(),
                startPositionTransform.getTranslateY());
            context.translate(objectTransform.getTranslateX(),
                objectTransform.getTranslateY());

            var length = 50 * startPositionTransform.getScaleY() * objectTransform.getScaleY();
            var width = 25 * startPositionTransform.getScaleX() * objectTransform.getScaleX();

            //context.save();
            for (var part in this.children) {
                context.save();
                var child = this.children[part];
                var transform = child.startPositionTransform;
                context.translate(transform.getTranslateX(), transform.getTranslateY());
                this.children[part].render(context);
                context.restore();
            }
            context.fillStyle = '#ff2800';
            context.fillRect(-width/2, -length/2, width, length);

            //windshield
            context.fillStyle = "aqua";
            context.fillRect(-width/2 + 2, length/2 -10, width - 4, 3);
            context.save();
            context.scale(1,-1);

            //back window
            context.fillStyle = "lightblue"
            context.fillRect(-width/2 + 2, length/2 -10, width - 4, 3);
            context.restore();

            //headlights
            context.fillStyle = "yellow";
            context.fillRect(-width/2 + 2, length/2 -5, 4, 4);
            context.save();
            context.scale(-1,1);
            context.fillRect(-width/2 + 2, length/2 -5, 4, 4);
            context.restore();

            if (this.state == SELECT_STATE.SCALABLE_LENGTH || this.state == SELECT_STATE.SCALABLE_WIDTH) {
                context.strokeStyle = "lightblue";
                context.strokeRect(-150/2, -200/2, 150, 200);
            }
            context.restore();
        },

        // Overrides parent method
        pointInObject: function (point) {
            var tempAffine = AffineTransform.getTranslateInstance(this.startPositionTransform.getTranslateX(),
                                                                        this.startPositionTransform.getTranslateY());
            tempAffine.translate(this.objectTransform.getTranslateX(), this.objectTransform.getTranslateY());
            var inverseTransform = tempAffine.createInverse();
            var inversePoint = [];
            inverseTransform.transform([point.x, point.y], 0,
                inversePoint, 0, 1);

            var pointX = inversePoint[0];
            var pointY = inversePoint[1];
            //console.log("Point x: ", pointX, "\nPoint y: ", pointY);
            var length = 50 * this.startPositionTransform.getScaleY() * this.objectTransform.getScaleY();
            var width = 25 * this.startPositionTransform.getScaleX() * this.objectTransform.getScaleX();

            var leftBound = -width/2;
            var rightBound = width/2;
            var lowerBound = -length/2;
            var upperBound = length/2;
            //console.log("upperBound:" + upperBound + "\nrightBound: " + rightBound);
            var inObject = pointX >= leftBound &&
                pointX <= rightBound &&
                pointY >= lowerBound &&
                pointY <= upperBound;

            if (inObject && pointY <= upperBound && pointY >= 0.85 * upperBound) {
                if (this.state == SELECT_STATE.MOUSE_DOWN) {
                    this.setState(SELECT_STATE.SCALABLE_LENGTH);
                    this.stretchFactor = 1;
                } else if (this.state == HOVER_STATE.DEFAULT) {
                    this.setState(HOVER_STATE.HOVER_SCALE);
                }
            } else if (inObject && pointY >= lowerBound && pointY <= 0.8 * lowerBound){
                if (this.state == SELECT_STATE.MOUSE_DOWN) {
                    this.setState(SELECT_STATE.SCALABLE_LENGTH);
                    this.stretchFactor = -1;
                } else if (this.state == HOVER_STATE.DEFAULT) {
                    this.setState(HOVER_STATE.HOVER_SCALE);
                }
            } else if(inObject && pointX <= rightBound && pointX >= 0.8 * rightBound) {
                if (this.state == SELECT_STATE.MOUSE_DOWN) {
                    this.setState(SELECT_STATE.SCALABLE_WIDTH);
                    this.stretchFactor = 1;
                } else if (this.state == HOVER_STATE.DEFAULT) {
                    this.setState(HOVER_STATE.HOVER_SCALE);
                }
            } else if (inObject && pointX >= leftBound && pointX <= 0.85 * leftBound) {
                if (this.state == SELECT_STATE.MOUSE_DOWN) {
                    this.setState(SELECT_STATE.SCALABLE_WIDTH);
                    this.stretchFactor = -1;
                } else if (this.state == HOVER_STATE.DEFAULT) {
                    this.setState(HOVER_STATE.HOVER_SCALE);
                }
            } else if (inObject &&
                      ((pointY < 0.85 * upperBound && pointY > 0.7 * upperBound) ||
                      (pointY > 0.85 * lowerBound && pointY < 0.7 * lowerBound)))
            {
                if (this.state == SELECT_STATE.MOUSE_DOWN) {
                    this.setState(SELECT_STATE.ROTATABLE);
                } else if (this.state == HOVER_STATE.DEFAULT) {
                    this.setState(HOVER_STATE.HOVER_ROTATE);
                }
            } else if (inObject) {
                if (this.state == SELECT_STATE.MOUSE_DOWN) {
                    this.setState(SELECT_STATE.DRAGGABLE);
                } else if (this.state == HOVER_STATE.DEFAULT) {
                    this.setState(HOVER_STATE.HOVER_DRAG);
                }
            } else {
                for (var part in this.children) {
                    var child = this.children[part];
                    child.pointInObject({x: pointX, y: pointY});
                }
            }


            return inObject;
        }
    });

    /**
     * @param axlePartName Which axle this node represents
     * @constructor
     */
    var AxleNode = function (axlePartName) {
        this.initGraphNode(new AffineTransform(), axlePartName);
        this.state = SELECT_STATE.DEFAULT;
    };

    _.extend(AxleNode.prototype, GraphNode.prototype, {
        // Overrides parent method
        render: function (context) {
            context.save();
            context.scale(this.startPositionTransform.getScaleX(), this.startPositionTransform.getScaleY());
            context.scale(this.objectTransform.getScaleX(), this.objectTransform.getScaleY());
            context.fillStyle = "black";
            context.fillRect(-30/2, -2, 30, 4);

            var left = this.children[FRONT_LEFT_TIRE_PART] || this.children[BACK_LEFT_TIRE_PART];
            var right = this.children[FRONT_RIGHT_TIRE_PART] || this.children[BACK_RIGHT_TIRE_PART];

            for (var part in this.children) {
                context.save();
                var child = this.children[part];
                var transform = child.startPositionTransform;
                //var oTransform = child.objectTransform;
                context.translate(transform.getTranslateX(),
                                  transform.getTranslateY());
                context.scale(1/this.objectTransform.getScaleX(), 1/this.objectTransform.getScaleY());
                context.scale(1/this.startPositionTransform.getScaleX(), 1/this.startPositionTransform.getScaleY());
                //context.translate(oTransform.getTranslateX(), oTransform.getTranslateX());
                this.children[part].render(context);
                context.restore();
            }
            context.restore();
        },

        // Overrides parent method
        pointInObject: function (point) {
            var tempAffine = this.startPositionTransform.clone();
            tempAffine.preConcatenate(this.objectTransform);
            var inverseTransform = tempAffine.createInverse();
            var inversePoint = [];
            inverseTransform.transform([point.x, point.y], 0,
                inversePoint, 0, 1);

            var pointX = inversePoint[0];
            var pointY = inversePoint[1];

            for (var part in this.children) {
                var child = this.children[part];
                child.pointInObject({x:pointX, y: pointY});
            }
            // User can't select axles
            return false;
        }
    });

    /**
     * @param tirePartName Which tire this node represents
     * @constructor
     */
    var TireNode = function (tirePartName) {
        this.initGraphNode(new AffineTransform(), tirePartName);
    };

    _.extend(TireNode.prototype, GraphNode.prototype, {
        // Overrides parent method
        render: function (context) {
            context.fillStyle = "grey";
            context.fillRect(-4, -9, 8, 18);
        },

        // Overrides parent method
        pointInObject: function (point) {
            var tempAffine = this.startPositionTransform.clone();
            tempAffine.preConcatenate(this.objectTransform);
            var inverseTransform = tempAffine.createInverse();
            var inversePoint = [];
            inverseTransform.transform([point.x, point.y], 0,
                inversePoint, 0, 1);
            var pointX = inversePoint[0];
            var pointY = inversePoint[1];

            var leftBound = -4;
            var rightBound = 4;
            var lowerBound = -9;
            var upperBound = 9;
            var inObject = pointX >= leftBound &&
                pointX <= rightBound &&
                pointY >= lowerBound &&
                pointY <= upperBound;

            if (inObject && this.state == HOVER_STATE.DEFAULT) {
                this.state = HOVER_STATE.HOVER_WHEEL;
            } else if (inObject && this.state == SELECT_STATE.MOUSE_DOWN) {
                this.state = SELECT_STATE.WHEEL;
            }

            return true;
        }
    });

    // Return an object containing all of our classes and constants
    return {
        GraphNode: GraphNode,
        CarNode: CarNode,
        AxleNode: AxleNode,
        TireNode: TireNode,
        CAR_PART: CAR_PART,
        FRONT_AXLE_PART: FRONT_AXLE_PART,
        BACK_AXLE_PART: BACK_AXLE_PART,
        FRONT_LEFT_TIRE_PART: FRONT_LEFT_TIRE_PART,
        FRONT_RIGHT_TIRE_PART: FRONT_RIGHT_TIRE_PART,
        BACK_LEFT_TIRE_PART: BACK_LEFT_TIRE_PART,
        BACK_RIGHT_TIRE_PART: BACK_RIGHT_TIRE_PART
    };
}
