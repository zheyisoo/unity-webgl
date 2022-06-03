using System.Runtime.InteropServices;
using UnityEngine;
using UnityEngine.UI;

public class MessageButtonController : MonoBehaviour {

  public string message;
  
  public Text ButtonText;

  [DllImport ("__Internal")]
  private static extern void Connect (string message);

  private void Awake () {
    this.GetComponent<Button> ().onClick.AddListener (() => {
      Connect (this.message);
    });
  }
  
public void SetAddress (string walletAddress) {
    ButtonText.text = walletAddress;
  }
  
}