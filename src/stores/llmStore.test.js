import { describe, it, expect, beforeEach } from 'vitest';
import { llm, llmActions, setLLM } from './llmStore';


describe('llmStore', () => {
    
    beforeEach(() => {
        setLLM({
            models: [],
            current: 0
        });
    });

    describe('initial state', () => {
        it('should start with an empty models array and current index 0', () => {
            expect(llm.models).toEqual([]);
            expect(llm.current).toBe(0);
        });
    });

    describe('updateModels action', () => {
        it('should update models and set the current model if defaultModel exists', () => {
            const newModels = ['GPT-4', 'Claude-3', 'Llama-3'];
            const defaultModel = 'Claude-3';

            llmActions.updateModels(newModels, defaultModel);

            expect(llm.models).toEqual(newModels);
            expect(llm.current).toBe(1);
            expect(llm.selectedModel).toBe('Claude-3');
        });

        it('should update models but keep current index if defaultModel is not found', () => {
            const newModels = ['GPT-4', 'Claude-3'];
            const defaultModel = 'NonExistent';

            setLLM('current', 0);

            llmActions.updateModels(newModels, defaultModel);

            expect(llm.models).toEqual(newModels);
            expect(llm.current).toBe(0); 
        });
    });

    describe('changeModel action', () => {
        it('should increment the current index', () => {
            const models = ['Model A', 'Model B', 'Model C'];
            llmActions.updateModels(models, 'Model A');

            llmActions.changeModel();

            expect(llm.current).toBe(1);
            expect(llm.selectedModel).toBe('Model B');
        });

        it('should wrap around to 0 when reaching the end of the array', () => {
            const models = ['Model A', 'Model B'];
            llmActions.updateModels(models, 'Model B');

            llmActions.changeModel();

            expect(llm.current).toBe(0);
            expect(llm.selectedModel).toBe('Model A');
        });

        it('should handle empty models array gracefully (prevent division by zero/NaN)', () => {
            llmActions.updateModels([], null);
            
            llmActions.changeModel();
            expect(llm.current).not.toBe(NaN);
        });
    });

    describe('selectedModel getter', () => {
        it('should correctly return the model object based on current index', () => {
            const models = ['Alpha', 'Beta'];
            llmActions.updateModels(models, 'Alpha');
            
            expect(llm.selectedModel).toBe('Alpha');
            
            llmActions.changeModel();
            expect(llm.selectedModel).toBe('Beta');
        });
    });
});