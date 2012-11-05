Shader "Solid over Color" {
	Properties {
		_Color ("Main Color", Color) = (1,1,1,0)
		_MainTex ("Texture Overlay (RGBA)", 2D) = "white" {}
	}
	SubShader {
		Pass {
			Material {
				Diffuse (1,1,1,1)
				Ambient (1,1,1,1)
			}
			Lighting On

            SetTexture [_MainTex] {
            	constantColor [_Color]
                combine texture lerp (texture) constant
            }
            
			SetTexture [_MainTex] {
				combine previous * primary
			}
		}
	}
	FallBack "Diffuse", 1
}
