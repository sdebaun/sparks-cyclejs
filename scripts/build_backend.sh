# Get current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo $CURRENT_BRANCH

# Clone backend
git clone https://github.com/sdebaun/sparks-backend
cd sparks-backend

# pull the current branch or fallback to using release
git fetch origin
git checkout $CURRENT_BRANCH || git checkout release

npm install
npm run build
