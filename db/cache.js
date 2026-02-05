import redis from 'redis';

const client = redis.createClient(
{
    url: "redis://localhost:6379"
}
);

client.on('error',()=>{
    console.log("Redis Client error")
});

(async()=>{
    await client.connect();
})();


export default client;
