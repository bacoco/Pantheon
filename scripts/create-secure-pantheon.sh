#!/bin/bash
# Create encrypted archive of Pantheon files

# Create a tarball of .claude directory
tar czf pantheon-commands.tar.gz .claude/

# Encrypt with a key (stored in environment variable)
openssl enc -aes-256-cbc -salt -in pantheon-commands.tar.gz -out pantheon-commands.enc -k "${PANTHEON_KEY:-default-key}"

# Remove original
rm pantheon-commands.tar.gz

echo "Encrypted Pantheon commands created"