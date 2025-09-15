class SortingSimulator {
    constructor() {
        this.array = [];
        this.originalArray = [];
        this.currentStep = 0;
        this.isSorting = false;
        this.algorithm = 'bubble';
        this.animationSpeed = 800; // milliseconds
        this.stepGenerators = {
            bubble: this.bubbleSortSteps.bind(this),
            insertion: this.insertionSortSteps.bind(this),
            selection: this.selectionSortSteps.bind(this)
        };

        this.initializeEventListeners();
        this.generateRandomArray();
    }

    initializeEventListeners() {
        document.getElementById('generate-btn').addEventListener('click', () => this.generateRandomArray());
        document.getElementById('sample-btn').addEventListener('click', () => this.loadSampleData());
        document.getElementById('start-btn').addEventListener('click', () => this.startSort());
        document.getElementById('step-btn').addEventListener('click', async () => {
            document.getElementById('step-btn').disabled = true;
            await this.step();
            document.getElementById('step-btn').disabled = false;
        });
        document.getElementById('reset-btn').addEventListener('click', () => this.reset());
        document.getElementById('algorithm-select').addEventListener('change', (e) => {
            this.algorithm = e.target.value;
            this.reset();
        });

        // Test animation button
        // document.getElementById('test-animation-btn').addEventListener('click', () => this.testAnimation());

        // Speed control
        const speedSlider = document.getElementById('speed-slider');
        const speedValue = document.getElementById('speed-value');
        speedSlider.addEventListener('input', (e) => {
            this.animationSpeed = parseInt(e.target.value);
            speedValue.textContent = `${this.animationSpeed}ms`;
        });
    }

    generateRandomArray() {
        this.array = [];
        const size = 8; // Fixed size for better visualization
        for (let i = 0; i < size; i++) {
            this.array.push(Math.floor(Math.random() * 50) + 1);
        }
        this.originalArray = [...this.array];
        this.renderArray();
        this.updateStatus('Array generated. Click "Start Sort" to begin.');
        document.getElementById('start-btn').disabled = false;
        document.getElementById('step-btn').disabled = true;
    }

    loadSampleData() {
        // Sample data designed to demonstrate each algorithm's characteristics
        const sampleData = {
            bubble: [5, 1, 4, 2, 8, 3, 7, 6], // Shows multiple swaps and bubbling behavior
            insertion: [9, 5, 1, 4, 3, 8, 2, 7], // Shows shifting and insertion behavior
            selection: [64, 25, 12, 22, 11, 45, 33, 18] // Shows selection of minimum values
        };

        this.array = [...sampleData[this.algorithm]];
        this.originalArray = [...this.array];
        this.renderArray();
        this.updateStatus(`Sample data loaded for ${this.algorithm} sort. Click "Start Sort" to begin.`);
        document.getElementById('start-btn').disabled = false;
        document.getElementById('step-btn').disabled = true;
    }

    renderArray(highlights = {}) {
        const container = document.getElementById('array-container');
        const circleContainers = container.querySelectorAll('.circle-container');

        // If we have existing containers, update them instead of recreating
        if (circleContainers.length === this.array.length) {
            circleContainers.forEach((circleContainer, index) => {
                const circle = circleContainer.querySelector('.circle');
                const indexLabel = circleContainer.querySelector('.index-label');

                circle.textContent = this.array[index];
                indexLabel.textContent = index;

                // Remove all highlight classes
                circle.classList.remove('swapping', 'comparing');

                // Apply comparison highlights
                if (highlights.comparing && highlights.comparing.includes(index)) {
                    circle.classList.add('comparing');
                }
            });
        } else {
            // Create new containers if array size changed
            container.innerHTML = '';
            this.array.forEach((value, index) => {
                const circleContainer = document.createElement('div');
                circleContainer.className = 'circle-container';

                const circle = document.createElement('div');
                circle.className = 'circle';
                circle.textContent = value;

                const indexLabel = document.createElement('div');
                indexLabel.className = 'index-label';
                indexLabel.textContent = index;

                // Apply comparison highlights
                if (highlights.comparing && highlights.comparing.includes(index)) {
                    circle.classList.add('comparing');
                }

                circleContainer.appendChild(circle);
                circleContainer.appendChild(indexLabel);
                container.appendChild(circleContainer);
            });
        }
    } startSort() {
        this.isSorting = true;
        this.currentStep = 0;
        this.stepGenerator = this.stepGenerators[this.algorithm]();
        document.getElementById('start-btn').disabled = true;
        document.getElementById('step-btn').disabled = false;
        this.updateStatus(`Starting ${this.algorithm} sort. Click "Step" to advance.`);
    }

    async step() {
        if (!this.isSorting) return;

        const result = this.stepGenerator.next();
        if (result.done) {
            this.finishSort();
        } else {
            // Handle swap animation if needed
            if (result.value.swap) {
                await this.animateSwap(result.value.swap.from, result.value.swap.to);
                // After swap animation, re-render the entire array to ensure correct display
                this.renderArray(result.value.highlights);
            } else {
                // Only call renderArray if no swap occurred, pass highlights for comparison
                this.renderArray(result.value.highlights);
            }

            this.updateStatus(result.value.message);
            document.getElementById('step-info').textContent = `Step ${this.currentStep + 1}`;
            this.currentStep++;

            // Add delay for animation to complete
            await this.delay(this.animationSpeed);
        }
    } reset() {
        this.isSorting = false;
        this.currentStep = 0;
        this.array = [...this.originalArray];
        this.renderArray();
        document.getElementById('start-btn').disabled = false;
        document.getElementById('step-btn').disabled = true;
        this.updateStatus('Reset. Select an algorithm and generate a new array or start sorting.');
        document.getElementById('step-info').textContent = '';
    }

    finishSort() {
        this.isSorting = false;
        document.getElementById('step-btn').disabled = true;
        this.renderArray();
        this.updateStatus('Sorting complete!');
        document.getElementById('step-info').textContent = '';
    }

    applyHighlights(highlights = {}) {
        const circles = document.querySelectorAll('.circle');

        circles.forEach((circle, index) => {
            // Remove all highlight classes
            circle.classList.remove('swapping', 'comparing');

            // Apply comparison highlights
            if (highlights.comparing && highlights.comparing.includes(index)) {
                circle.classList.add('comparing');
            }
        });
    }

    updateStatus(message) {
        document.getElementById('status').textContent = message;
    }

    async testAnimation() {
        console.log('Testing animations...');
        const circles = document.querySelectorAll('.circle');

        if (circles.length >= 3) {
            // Test comparison highlighting
            circles[0].classList.add('comparing');
            circles[1].classList.add('comparing');
            await this.delay(1000);

            circles[0].classList.remove('comparing');
            circles[1].classList.remove('comparing');

            // Test swap animation
            await this.animateSwap(0, 2);
        }

        console.log('Animation test completed');
    } delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async animateSwap(fromIndex, toIndex) {
        const container = document.getElementById('array-container');
        const circleContainers = Array.from(container.querySelectorAll('.circle-container'));

        if (circleContainers.length <= Math.max(fromIndex, toIndex)) return;

        const fromContainer = circleContainers[fromIndex];
        const toContainer = circleContainers[toIndex];
        const fromCircle = fromContainer.querySelector('.circle');
        const toCircle = toContainer.querySelector('.circle');

        // Add swapping class for visual feedback
        fromCircle.classList.add('swapping');
        toCircle.classList.add('swapping');

        // Calculate the distance to move
        const fromRect = fromCircle.getBoundingClientRect();
        const toRect = toCircle.getBoundingClientRect();
        const distance = toRect.left - fromRect.left;

        // Animate the movement
        fromCircle.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        toCircle.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';

        fromCircle.style.transform = `translateX(${distance}px)`;
        toCircle.style.transform = `translateX(${-distance}px)`;

        // Wait for animation to complete
        await this.delay(600);

        // Don't manually swap text content - let renderArray handle it
        // const temp = fromCircle.textContent;
        // fromCircle.textContent = toCircle.textContent;
        // toCircle.textContent = temp;

        // Instead of resetting transforms, swap the DOM positions of containers
        const parent = container;
        const referenceNode = circleContainers[toIndex + 1] || null;

        // Remove both containers
        parent.removeChild(fromContainer);
        parent.removeChild(toContainer);

        // Re-insert them in swapped positions
        if (fromIndex < toIndex) {
            parent.insertBefore(toContainer, referenceNode);
            parent.insertBefore(fromContainer, toContainer);
        } else {
            parent.insertBefore(fromContainer, referenceNode);
            parent.insertBefore(toContainer, fromContainer);
        }

        // Reset transforms now that elements are in correct DOM positions
        fromCircle.style.transform = '';
        toCircle.style.transform = '';
        fromCircle.style.transition = '';
        toCircle.style.transition = '';

        // Don't remove swapping class here - let applyHighlights handle it
        // fromCircle.classList.remove('swapping');
        // toCircle.classList.remove('swapping');
    }

    *bubbleSortSteps() {
        const n = this.array.length;
        for (let i = 0; i < n - 1; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                yield {
                    highlights: { comparing: [j, j + 1] },
                    message: `Comparing elements at positions ${j} and ${j + 1}`
                };

                if (this.array[j] > this.array[j + 1]) {
                    [this.array[j], this.array[j + 1]] = [this.array[j + 1], this.array[j]];
                    yield {
                        highlights: { comparing: [j, j + 1] },
                        swap: { from: j, to: j + 1 },
                        message: `Swapped elements at positions ${j} and ${j + 1}`
                    };
                }
            }
            yield {
                highlights: {},
                message: `Pass ${i + 1} complete. Element at position ${n - i - 1} is now in its final position.`
            };
        }
    }

    *insertionSortSteps() {
        const n = this.array.length;
        for (let i = 1; i < n; i++) {
            const key = this.array[i];
            let j = i - 1;

            yield {
                highlights: { comparing: [i] },
                message: `Considering element at position ${i} (value: ${key})`
            };

            while (j >= 0 && this.array[j] > key) {
                yield {
                    highlights: { comparing: [j, j + 1] },
                    message: `Element at position ${j} > ${key}, shifting right`
                };

                // Shift element to the right (not swap!)
                this.array[j + 1] = this.array[j];
                j--;

                yield {
                    highlights: { comparing: [j + 1] },
                    message: `Shifted element to position ${j + 1}`
                };
            }

            this.array[j + 1] = key;
            yield {
                highlights: { comparing: [j + 1] },
                message: `Inserted element ${key} at position ${j + 1}`
            };
        }
    }

    *selectionSortSteps() {
        const n = this.array.length;
        for (let i = 0; i < n - 1; i++) {
            let minIdx = i;

            for (let j = i + 1; j < n; j++) {
                yield {
                    highlights: { comparing: [minIdx, j] },
                    message: `Comparing elements at positions ${minIdx} and ${j}`
                };

                if (this.array[j] < this.array[minIdx]) {
                    minIdx = j;
                    yield {
                        highlights: { comparing: [minIdx] },
                        message: `New minimum found at position ${minIdx}`
                    };
                }
            }

            if (minIdx !== i) {
                [this.array[i], this.array[minIdx]] = [this.array[minIdx], this.array[i]];
                yield {
                    highlights: { comparing: [i, minIdx] },
                    swap: { from: i, to: minIdx },
                    message: `Swapped elements at positions ${i} and ${minIdx}`
                };
            }

            yield {
                highlights: {},
                message: `Element at position ${i} is now in its final position`
            };
        }
    }
}

// Initialize the simulator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SortingSimulator();
});