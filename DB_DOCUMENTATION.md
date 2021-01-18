# HFP database

The database for HFP data uses Citus to distribute the data to multiple machines in a cluster.

1. HFP messages are written to different tables depending on their type. Vehicle position messages (HFP event type `vp`) are written to `vehicleposition` table, stop event messages (HFP event types `due`, `arr`, `dep`, `ars`, `pde`, `pas`, `wait`) to `stopevent` table, traffic light priority event messages (HFP event types `tlr` and `tla`) to `lightpriorityevent` table, and the rest of messages to `otherevent` table. Vehicle position messages for vehicles that are not registered to a journey are written to `unsignedevent` table.
2. [Distributed tables](https://docs.citusdata.com/en/v9.3/develop/api_udf.html#create-distributed-table) are used to place data for each vehicle in a same shard. Column `unique_vehicle_id` is used for distributing the tables.
3. The events are distributed to partitions based on their timestamp (`tst`). Each partition contains data for one day and the partitions are retained for four months. pg_partman is used to automate the management of the partitions. pg_cron is used to run `SELECT partman.run_maintenance(p_analyze := false);` hourly, which removes partitions that contain old data.

## Rebalancing the shards

In some cases, it is possible that the shards are not equally balanced among the machines in the cluster and some of the disks are getting filled up. In that case, you can run `SELECT rebalance_table_shards('table_name');` (e.g. `SELECT rebalance_table_shards('vehicleposition');` to redistribute the the shards among the machines.
