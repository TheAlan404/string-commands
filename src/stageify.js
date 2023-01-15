/**
 * Sort middlewares
 * Original by ChatGPT, modified by dennis.
 * @author ChatGPT
 * @param {import(".").CommandHandlerMiddleware<any>[]} middlewares
 * @returns {import(".").CommandHandlerMiddleware<any>[]}
 */
const topologicalSort = (middlewares) => {
    // Create a map of middleware id to middleware object
    const middlewareMap = new Map();
    for (const mw of middlewares) {
        middlewareMap.set(mw.id, mw);
    }

    // Create a directed graph, where each middleware is a node
    // and the edges represent the dependencies between them
    const graph = new Map(middlewares.map((mw) => [mw.id, {
        incoming: new Set(),
        outgoing: new Set(),
        state: "unvisited",
    }]));

    for (const mw of middlewares) {
        if (mw.before) {
            graph.get(mw.id).outgoing.add(mw.before);
            graph.get(mw.before).incoming.add(mw.id);
        }

        if (mw.after) {
            graph.get(mw.id).incoming.add(mw.after);
            graph.get(mw.after).outgoing.add(mw.id);
        }

        if (mw.requires) {
            for (const required of mw.requires) {
                graph.get(mw.id).incoming.add(required);
                graph.get(required).outgoing.add(mw.id);
            }
        }
    }

    for (const [id, { state }] of graph) {
        if (state === 'unvisited') {
            if (hasCycle(graph, id)) {
                throw new Error("Circular dependency in middleware stack!");
            }
        }
    }

    // Create a queue of nodes with no incoming edges
    const queue = [];
    for (const [id, { incoming }] of graph) {
        if (incoming.size === 0) {
            queue.push(id);
        }
    }

    // Perform topological sort
    const sortedMiddlewares = [];
    while (queue.length > 0) {
        const id = queue.shift();
        sortedMiddlewares.push(middlewareMap.get(id));

        for (const nextId of graph.get(id).outgoing) {
            graph.get(nextId).incoming.delete(id);
            if (graph.get(nextId).incoming.size === 0) {
                queue.push(nextId);
            }
        }
    }

    // Return the sorted array of middlewares
    return sortedMiddlewares;
}

/**
 * Cycle detection
 * Original by ChatGPT, modified by dennis.
 * @author ChatGPT
 * @param {Map<string, import(".").CommandHandlerMiddleware<any>>} graph 
 * @param {string} id 
 * @returns {boolean}
 */
function hasCycle(graph, id) {
    if (graph.get(id).state === 'visiting') {
        return true;
    }

    graph.get(id).state = 'visiting';

    for (const nextId of graph.get(id).outgoing) {
        if (hasCycle(graph, nextId)) {
            return true;
        }
    }

    graph.get(id).state = 'visited';
    return false;
}

/**
 * Create a stage executor
 * @param {import(".").CommandHandlerMiddleware<any>[]} unsorted 
 */
const stageify = (unsorted) => {
    let list = topologicalSort(unsorted);

    const execute = async (ctx) => {
        let prevIndex = -1;

        let runner = async (index) => {
            if(index === prevIndex) {
                throw new Error("next() called multiple times in middleware");
            };

            prevIndex = index;
            let mw = list[index];
            if(!mw) return;
            // TODO: maybe `next(e: Error?)` idk if it would emit an error or maybe a custom handler?
            await mw.run(ctx, () => {
                return runner(index + 1);
            });
        };

        await runner(0);
    };

    return { execute, list };
}

if (process.argv.includes("--test-stageify")) {
    console.log("stageify testing...");

    let done = false;

    let {execute, list } = (stageify([
        { id: "A", run: (ctx, next) => {
            console.log("A");
            next();
        }, before: "C" },
        { id: "B", run: (ctx, next) => {
            console.log("B")
            next()
        }, after: "A" },
        { id: "C", run: (ctx, next) => {
            console.log("C")
            next()
        } },
        { id: "D", run: (ctx, next) => {
            console.log("E")
            next()
        }, after: "A" },
        { id: "E", run: (ctx, next) => {
            console.log("D")
            next();
        }, requires: ["B"] },
    ]));

    // Expected: ADBEC | ACBED etc

    console.log("=== LIST ===");
    console.log(list);
    console.log("===  END ===");
    console.log();
    console.log("Executing...");
    execute().then(() => {
        console.log("Execute async ended");
    });
    while(!done) {};
    console.log("While loop exited");
}

export {
    stageify,
}