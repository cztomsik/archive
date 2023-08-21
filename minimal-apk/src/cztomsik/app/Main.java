package cztomsik.app;

import android.app.Activity;
import android.os.Bundle;
import android.widget.TextView;

public class Main extends Activity {
  @Override
  public void onCreate(Bundle b) {
    super.onCreate(b);

    TextView label = new TextView(this);
    label.setText("Hello");

    setContentView(label);
  }
}

