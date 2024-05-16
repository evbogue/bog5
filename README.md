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
<sha256 hash of name || pubkey ><sha256 hash of image || pubkey><sha256 hash of content><sha256 hash of previous protocol msg || same sha256 hash>
```

Sign a timestamped hash, as this allows sorting a log by date without any other data. We can also send posts around without sending data around.

```
<pubkey><signature of timestamp and hash of post>
```

And then we store the protocol message by it's hash in the kv store, so we can request protocol messages only by their hash.

```
await bogbot.make(protocolHash, protocol)
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

Finally we create a log of hashes that we can iterate over to open messages. To store we open all of the messages and then create a chronological hashlog. 

---
MIT 
