cd ../../imparse/git-repository
release.sh
cd ../../informl/git-repository
release.sh
cd ../../aartifact/git-repository

echo Fetching compiled files from dependencies.
cp ../../imparse/git-repository/JavaScript/Imparse.js environment-interface-web/external/Imparse.js
cp ../../informl/git-repository/JavaScript/Informl.js environment-interface-web/external/Informl.js
echo Done.
echo