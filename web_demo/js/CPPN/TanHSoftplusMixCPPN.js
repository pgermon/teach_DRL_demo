class TanHSoftplusMinCPPN extends BaseCPPN{
    /*
     * Feedforward CPNN with 4 layers of 64 units alternating TanH/Softplus activation functions.
     */

    generator() {
        tf.result_default_graph();
        // inputs to cppn
        this.inputs = tf.placeholder(tf.float32, [this.x_dim, this.input_dim + 1]);

        this.h1_weights = tf.Variable(tf.truncated_normal([this.input_dim + 1, 64], mean=0.0, stddev=2.0));
        let h1 = tf.nn.tanh(tf.matmul(this.input, this.h1_weights));

        this.h2_weights = tf.Variable(tf.truncated_normal([64, 64], mean=0.0, stddev=2.0));
        let h2 = tf.nn.softplus(tf.matmul(h1, this.h2_weights));

        this.h3_weights = tf.Variable(tf.truncated_normal([64, 64], mean=0.0, stddev=2.0));
        let h3 = tf.nn.tanh(tf.matmul(h2, this.h3_weights));

        this.h4_weights = tf.Variable(tf.truncated_normal([64, 64], mean=0.0, stddev=2.0));
        let h4 = tf.nn.softplus(tf.matmul(h3, this.h4_weights));

        this.output_weights = tf.Variable(tf.truncated_normal([64, this.output_dim], mean=0.0, stddev=2.0));
        let output = tf.matmul(h4, this.output_weights);
        let result = tf.reshape(output, [this.x_dim, this.output_dim]);

        return result;
    }
}