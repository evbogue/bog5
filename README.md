# Bog5 

### Possible alternative secure message protocol for a gossip system

Generate a ed25519 keypair

```
const keypair = await bogbot.keypair()
const pubkey = await bogbot.pubkey()
const privkey = await bogbot.privkey()
```

Create a valid message, four 44 char base64 pubkeys or hashes and store it as a blob.

```
<hash256 hash of name || pubkey ><hash256 hash of image || pubkey><sha 256 hash of content><previous hash || same sha256 hash>
```

Sign a timestamped hash, as this allows sorting a log by date without any other data. We can also send posts around without sending data around.

```
<pubkey><signature of timestamp and hash of post>
```

All of this is done using

```
const msg = await bogbot.publish(data)
```

and we use 

```
const content = await bogbot.open(msg)
```

Which returns a JSON object, checking first to see if we already have all of the various hashlinks.





  
