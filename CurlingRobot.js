import {index_of_max} from './utils.js';
import {random_choose} from "./utils.js";
import {gaussian} from "./utils.js";
import {set_nan} from "./utils.js";

class ActionSpace {
    // Action space is the list of [v, t]
    constructor(vmin=50, vmax=200, tmin=50, tmax=150, clip=6) {
        this.vspace = [];
        this.tspace = [];
        this.action_space = [];
        let vstep = (vmax - vmin) / (clip - 1);
        let tstep = (tmax - tmin) / (clip - 1);
        for (let i = 0; i < clip; i++) {
            this.vspace.push(vmin + i*vstep);
            this.tspace.push(tmin + i*tstep);
        }
        for (let i =0; i < this.vspace.length; i++) {
            for (let j = 0; j < this.tspace.length; j++) {
                this.action_space.push([this.vspace[i], this.tspace[j]]);
            }
        }

        // 按v+t的大小排序
        this.action_space.sort(function(a,b){
            return (a[0]+a[1]) - (b[0] + b[1]);
        });
    }


    // '''
    // action index -> action
    // output: [v, t]
    // '''
    output_action(index, action_space = this.action_space) {
        let v = action_space[index][0];
        let t = action_space[index][1];
        let v_gaussian_array = [];
        let t_gaussian_array = [];
        let v_gaussian_function = gaussian(v, 3);
        let t_gaussian_function = gaussian(t, 3);

        // make a bunch of standard variates
        for(let i=0; i<2000; i++) {
            v_gaussian_array.push(v_gaussian_function());
            t_gaussian_array.push(t_gaussian_function());
        }
        // console.log(v_gaussian_array);
        // console.log(t_gaussian_array);

        return {
            v: random_choose(v_gaussian_array),
            t: random_choose(t_gaussian_array)
        }
    }


}


class CurlingEnv {
    // constructor
    constructor() {
        this.action_space = new ActionSpace();
        this.observation_space = [0,1,2,3,4];
        this.state_count = 0;
        this.observation = 0;
        this.observation_ = 1;
    }

    step() {
        this.observation = this.observation_space[this.state_count];
        this.state_count += 1;
        if (this.state_count === 5) {
            this.observation_ = 'terminal';
        } else {
            this.observation_ = this.observation_space[this.state_count];
        }

        return {
            s: this.observation,
            s_: this.observation_,
        };
    }

    // 遍历完5个目标后，重置目标值
    reset() {
        this.state_count = 0;
    }
}


class QLearningTable {
    // constructor
    constructor(num_state, num_actions, learning_rate=0.1, reward_decay=1.0, e_greedy=0.75) {
        this.num_state = num_state;
        this.num_actions = num_actions;
        this.lr = learning_rate;
        this.gamma = reward_decay;
        this.epsilon = e_greedy;
        // q_table (state x actions)
        this.q_table = [];
    }

    init_q_table(num_state = this.num_state, num_actions = this.num_actions) {
        let q_table = [];
        for(let i = 0;i<num_state;i++){
            q_table[i] = [];
            for(let j = 0;j<num_actions;j++){
                q_table[i][j] = 0;
            }
        }
        this.q_table = q_table;
    }

    // '''
    // output: index of the max valuable action from action space.
    // '''
    choose_action_index(observation) {
        let action_index = 0;
        let state_action = this.q_table[observation];
        if (Math.random() < this.epsilon) {
             // choose best action
             action_index = index_of_max(state_action);
         }  else {
             // choose random action
             console.log('choose random!');
             action_index = Math.floor(Math.random() * this.num_actions);
         }
         return action_index
    }


    learn(s, a, r, s_) {
        let q_predict = this.q_table[s][a];
        let q_target = 0;
        let max = 0;
        if (s_ !== 'terminal') {
            max = Math.max(...this.q_table[s_]);
            q_target = r + (this.gamma * max); // next state is not terminal
        } else {
            q_target = r  // next state is terminal
        }
        let q_value = this.lr * (q_target - q_predict);
        this.q_table[s][a] +=   q_value;  // update
        // 把奖励值小的Q自动赋值为小的奖励
        if (r === 1) {
            set_nan(this.q_table[s], 3, a, q_value);
        }
        if (r === 2) {
            set_nan(this.q_table[s], 2, a, q_value);
        }
        if (r === 3) {
            set_nan(this.q_table[s], 1, a, q_value);
        }

    }

}


function train(max_episode = 5) {
    const env = new CurlingEnv();
    let a = new ActionSpace();
    const RL = new QLearningTable(5, a.action_space.length);
    RL.init_q_table();
    console.log('Begin!');

    for (let num=0; num<max_episode; num++) {
        env.reset();
        for (let t = 0; t < env.observation_space.length; t++) {
            let result = env.step();
            let observation = result.s;
            let observation_ = result.s_;
            let action_index = RL.choose_action_index(observation);
            let v = a.output_action(action_index).v;
            let t = a.output_action(action_index).t;
            console.log('episode:', num, '/',max_episode, 'observation:', observation,  'v=:', v,  't=:', t, 'observation_:', observation_);
            let reward = parseInt(prompt("请输入本次奖励值 (0-5): ","0"));
            RL.learn(observation, action_index, reward, observation_);
            observation = observation_;
            console.log(RL.q_table);
        }
    }

    return RL.q_table;
}

function play(state, q_table) {
    return index_of_max(q_table[state]);
}



// 训练之后获取Q table
let table = train(2);
// 由v,t构成的动作空间
let a = new ActionSpace();
// 设定目标：
let state = 3;
// 输入目标state，输出对应的[v,t]索引
let action_index = play(state, table);
let v = a.output_action(action_index).v;
let t = a.output_action(action_index).t;

console.log('q_table', table);
console.log('action_space', a.action_space);
console.log('state: ', state);
console.log('action_index', action_index);
console.log('v = ', v);
console.log('t = ', t);