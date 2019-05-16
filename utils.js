// Random choice an element in an array
export function random_choose(choices) {
    var index = Math.floor(Math.random() * choices.length);
    return choices[index];
}

// '''
// output: index of the max element from an array.
// '''
export function index_of_max(arr) {
    if (arr.length === 0) {
        return -1;
    }

    var max = arr[0];
    var maxIndex = 0;
    var maxArr = [];

    for (var i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            maxIndex = i;
            max = arr[i];
        }
    }

    for (var j = 1; j < arr.length; j++) {
        if (arr[j] === max) {
            maxArr.push(j);
        }
    }

    return random_choose(maxArr);
}

// returns a gaussian random function with the given mean and stdev.
export function gaussian(mean, stdev) {
    var y2;
    var use_last = false;
    return function() {
        var y1;
        if(use_last) {
            y1 = y2;
            use_last = false;
        }
        else {
            var x1, x2, w;
            do {
                x1 = 2.0 * Math.random() - 1.0;
                x2 = 2.0 * Math.random() - 1.0;
                w  = x1 * x1 + x2 * x2;
            } while( w >= 1.0);
            w = Math.sqrt((-2.0 * Math.log(w))/w);
            y1 = x1 * w;
            y2 = x2 * w;
            use_last = true;
        }

        var retval = mean + stdev * y1;
        if(retval > 0)
            return retval;
        return -retval;
    }
}