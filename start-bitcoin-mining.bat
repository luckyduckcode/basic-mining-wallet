@echo off
echo 🚀 Starting Bitcoin Mining
echo ===============================
echo.
echo 💎 Coin: Bitcoin (BTC)
echo ⚙️  Algorithm: sha256
echo 👛 Wallet: 1KkrieZqZrSZaUKDBSYCum8SFpBzsk4wnw
echo 📈 Expected Daily Profit: $15923.75
echo.
echo Starting GMiner...
echo.

cd /d C:\GMiner
gminer.exe --algo sha256 --server stratum+tcp://btc-us.f2pool.com:1314 --user 1KkrieZqZrSZaUKDBSYCum8SFpBzsk4wnw --pass x --intensity auto --temp_limit 85 --pl 80

pause