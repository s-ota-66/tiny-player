# Tiny Player



Web Audioスタディプロジェクトです。



音声ファイル（あるいはストリーミング）を独自のエフェクトをかけて再生することをゴールとします。



## 実行方法

ローカルでindex.htmlを開いても、起動はできますが、CORSによりローカルマシンにある音声ファイルにアクセスできません。

WEBサーバーからindex.htmlを起動する必要があります。



Rubyがインストールされている場合、index.htmlのあるディレクトリで、WEBrickを起動します。
macOSの場合、run.shを実行してください。

```shell
./run.sh
```
Chromeが起動して実行します。


他のOSの場合、なんらかの方法でWebサーバーを起動して実行してください。

Rubyの場合は以下になります。
```shell
uby -r webrick -e "s = WEBrick::HTTPServer.new(:Port => 8000, :DocumentRoot => Dir.pwd); trap('INT') { s.shutdown }; s.start"
```

Webブラウザから、localhost:8000 にアクセスすると起動します。



## 実行画面

![スクリーンショット_2024-02-20_12.18.00](http://uni2.jkeg.jvckenwood.info/gitlab/600785/tiny-player/uploads/37667653cbb2fbd3180be3c0100b6321/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88_2024-02-20_12.18.00.png)

