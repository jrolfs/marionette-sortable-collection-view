// Sortable Collection View Mixin
// ---------------

Marionette.SortableCollectionView = {

    appendHtml: function (collectionView, itemView, index) {

        if (collectionView.isBuffering) {
            var children = collectionView.elBuffer.childNodes;

            if (children.length <= index) {
                collectionView.elBuffer.appendChild(itemView.el);
            } else {
                collectionView.elBuffer.insertBefore(itemView.el, children[index]);
            }
        } else {
            var $container = this._getContainer(collectionView);
            var $children = $container.children();

            if ($children.size() <= index) {
                $container.append(itemView.el);
            } else {
                $children.eq(index).before(itemView.el);
            }
        }
    },

    sort: function (collection, options) {
        options || (options = {});

        // Determine whether we actually need a full element sort

        var sortedOrder = this.collection.pluck('id');
        var actualOrder = _.map(this._getContainer(this).children(), function (el) {
            this.children.map(function (child) {
                if (child.el === el) return child;
            });
        }, this);

        if (_.isEqual(sortedOrder, actualOrder)) return false;

        // Remove the existing child elements from the DOM to avoid
        // DOM manipulation for every remove-and-add-to-buffer fragment
        this._getContainer(this).empty();

        // Dump any views that don't exist in the new sort

        var stales = _.difference(actualOrder, sortedOrder);

        for (var i = 0; i < stales.length; i++) {
            var view = this.children.findByModel(this.collection.get(stales[i]));
            view.close();
            this.children.remove(view);
        }

        // Buffer view elements back into the DOM in the correct order
        // while instantiating views for any models added in the sort

        this.startBuffering();

        this.collection.models.each(function (model, index) {
            var existing = this.children.findByModel(model);
            
            if (existing) {
                this.appendHtml(this, existing, index);
            } else {
                this.addItemView(model, this.getItemView(model), index);
            }
        });

        this.endBuffering();

        return true;
    },

    _getContainer: function (collectionView) {
        if (_.isFunction(collectionView.getItemViewContainer)) {
            return collectionView.getItemViewContainer(collectionView);
        } else {
            return collectionView.$el;
        }
    }
};
