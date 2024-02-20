# Tiny Player



Web Audioスタディプロジェクトです。



音声ファイル（あるいはストリーミング）を独自のエフェクトをかけて再生することをゴールとします。



## 実行方法

ローカルでindex.htmlを開いても、起動はできますが、CORSによりローカルマシンにある音声ファイルにアクセスできません。

WEBサーバーからindex.htmlを起動する必要があります。



Rubyがインストールされている場合、index.htmlのあるディレクトリで、WEBrickを起動します。

```shell
╭─ ~/dev/web/tiny-player  main !1                                   ✔  21m 22s 
╰─ ruby -run -ehttpd . -p9001
```



Webブラウザから、localhost:9001 にアクセスすると起動します。



## 実行画面







