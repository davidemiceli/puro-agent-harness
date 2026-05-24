import { createStore } from 'solid-js/store';


export const [category, setCategory] = createStore({
    categories: ['agent', 'skill', 'rule'],
    current: 0,
    get selectedCategory() {
        return this.categories[this.current];
    }
});

export const categoryActions = {

    change: () => setCategory(v => ({
        current: (v.current + 1) % v.categories.length
    })),

};
