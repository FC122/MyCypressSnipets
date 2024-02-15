const recurse = async (task, condition, settings = { limit: 1, timeout: 10000, delay: 1000 }) => {
        let endTime = performance.now() + settings.timeout + settings.delay
        while (settings.limit > 0 && performance.now() < endTime) {
            let taskResult = await task()
            let conditionResult = await condition(taskResult)
            settings.limit--
            if (conditionResult) {
                return taskResult
            } else {
                setTimeout(() => {
                    console.log('Limit: ' + settings.limit)
                }, settings.delay)
            }
        }
        throw new Error('Recurse failed')
    }
