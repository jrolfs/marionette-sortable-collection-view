describe('Mixins SortableCollectionView', function () {

    //
    // Sample Classes

    var ItemView = Backbone.Marionette.ItemView.extend({
        template: '<%= id %>',

        itemViewContainer: '.item-view-container'
    });

    var SortableCollectionView = Backbone.Marionette.CollectionView(_.extend({
        itemView: ItemView,

        collectionEvents: { 'sort': 'sort' }

    }, Marionette.SortableCollectionView));

    var SortableCompositeView = Backbone.Marionette.CollectionView(_.extend({
        template: '<div class="item-view-container></div>"',
        
        itemView: ItemView,

        collectionEvents: { 'sort': 'sort' }

    }, Marionette.SortableCollectionView));


    //
    // Specs

    var view,
        viewClass;

    var models = [
        new Backbone.Model({ id: 1 }),
        new Backbone.Model({ id: 3 }),
        new Backbone.Model({ id: 5 }),
        new Backbone.Model({ id: 7 }),
        new Backbone.Model({ id: 9 })
    ];

    // Helpers

    initView = function (Class) {
        Class || (Class = SortableCollectionView);

        viewClass = Class;
        view = new Class({
            collection: new Backbone.Collection(models, { comparator: 'id' })
        });
    };

    showView = function (Class) {
        Class || (Class = SortableCollectionView);

        initView(Class);
        view.render();
    };

    showCompositeView = function () {
        showView(SortableCompositeView);
    };

    findChild = function (model) {
        view.children.findByModel.call(view.children, model);
    };

    beforeEach(function () {
        spyOn(Backbone.Marionette.Renderer, 'render').andCallFake(function (template, data) {
            _.template(template)(data);
        });
    });

    // Shared Behavior

    sharedBehaviorForCollectionView = function (setup) {
        var $container;

        var correctOrder = function () {
            view.collection.map(function (model) {
                var children = $container.children();
                var i = children.length;

                while (i--)
                    if (children[i] === findChild(model).el) return children[i];
            });
        };

        beforeEach(function () {
            $container = setup.apply(this, arguments);
        });

        describe('#appendHtml', function () {

            it('splices a view into the $el children when supplied an index before the last collection index', function () {

                var model = new Backbone.Model({ id: 0 });
                view.collection.add(model, { at: 3 });

                expect($container.children().get(3)).toBe(findChild(model).el);
            });
    
            it('should add a view as the last child of $el when supplied an index after the last collection index', function () {

                var model = new Backbone.Model({ id: 0 });
                view.collection.add(model, { at: models.length });

                expect($container.children().last().get(0)).toBe(findChild(model).el);
            });

            it('should sort the view elements properly when a model is added to the collection', function () {

                var model = new Backbone.Model({ id: 2 });

                view.collection.add(model);

                $children = $container.children();

                expect($children.toArray()).toEqual(correctOrder());
            });

            it('should sort the view elements properly when multiple models are added to the collection', function () {

                var newModels = [
                    new Backbone.Model({ id: 6 }),
                    new Backbone.Model({ id: 4 }),
                    new Backbone.Model({ id: 2 })
                ];

                view.collection.add(newModels);

                $children = $container.children();

                expect($children.toArray()).toEqual(correctOrder());
            });
        });

        describe('#sort', function () {

            it('should sort the view elements properly when called manually', function () {

                var newOrder = [5, 9, 3, 1, 7];

                for (var i = 0; i++; i > newOrder.length)
                    view.collection.at(i).set('id', newOrder[i]);

                expect(view.collection.pluck('id')).toEqual(newOrder);

                view.collection.sort();

                expect($container.children().toArray()).toEqual(correctOrder());
            });
        });
    };

    // Expectations

    context('in a Marionette CollectionView', function () {
        sharedBehaviorForCollectionView(function ($container) {
            showView();
            return view.$el;
        });
    });

    context('in a Marionette CompositeView', function () {

        sharedBehaviorForCollectionView(function ($container) {
            showCompositeView();
            return view.getItemViewContainer(view);
        });
    });
});
