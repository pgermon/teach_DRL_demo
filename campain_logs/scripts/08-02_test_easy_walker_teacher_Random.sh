#!/bin/sh
#SBATCH --ntasks=1
#SBATCH --cpus-per-task=8
#SBATCH -p inria
#SBATCH -t 48:00:00
#SBATCH --open-mode=append
#SBATCH -o campain_logs/jobouts/08-02_test_easy_walker_teacher_Random.sh.out
#SBATCH -e campain_logs/jobouts/08-02_test_easy_walker_teacher_Random.sh.err
export EXP_INTERP='/gpfs/home/pgermon/miniconda3/envs/teachDRL/bin/python' ;
mkdir ACL_bench/data/08-02_test_easy_walker_teacher_Random
# Copy itself in experimental dir
cp $SLURM_JOB_NAME ACL_bench/data/08-02_test_easy_walker_teacher_Random/08-02_test_easy_walker_teacher_Random.sh
# Add info about git status to exp dir
current_commit="$(git log -n 1)"
echo "${current_commit}" > ACL_bench/data/08-02_test_easy_walker_teacher_Random/git_status.txt
# Launch !
cpu_list=$(taskset -pc $$ | sed -E "s/(.*): (.*)/\2/g" | tr "," "\n" | sed -E "s/^[0-9]*$/&-&/g" | sed -E "s/-/ /g" | xargs -l seq | tr "\n" " ")
COUNT=${1:-0}
i=0
cpus=""
for cpu in $cpu_list; do
cpus="$cpus$cpu"
i=$(($i+1))
if [ "$i" = "1" ]; then
taskset -c $cpus $EXP_INTERP run.py --exp_name 08-02_test_easy_walker_teacher_Random  --seed $COUNT --env parametric-continuous-walker-v0 --student sac_v0.1.1 --backend tf1 --steps_per_ep 500000 --nb_test_episode 100 --nb_env_steps 10 --teacher Random &
echo "Using cpus $cpus for seed $COUNT"
COUNT=$(( $COUNT + 1 ))
cpus=""
i=0
else
cpus="$cpus,"
fi
done
wait
